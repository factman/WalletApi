/* eslint-disable @typescript-eslint/no-explicit-any */
import Knex from "knex";
import { describe, expect, it, vi } from "vitest";

import { SCHEMA_TABLES, SCHEMA_VIEWS } from "../../helpers/constants";
import { Repository } from "../Repository";

// Mock dependencies
vi.mock("../../helpers/constants", () => ({
  SCHEMA_TABLES: { USERS: "users" },
  SCHEMA_VIEWS: { USER_VW: "user_vw" },
}));
vi.mock("../../configs/database", () => ({
  __esModule: true,
  default: vi.fn(() => "knex-table-mock"),
}));

// Dummy model interface
interface DummyModel {
  id: string;
  name: string;
}

// Concrete subclass for testing
class DummyRepository extends Repository<DummyModel> {
  public getTable() {
    return this.table;
  }
  public getUuid() {
    return this.uuid;
  }
}

describe("Repository", () => {
  it("should set tableName and knex in constructor", () => {
    const repo = new DummyRepository(SCHEMA_TABLES.USERS) as any;
    expect(repo.tableName).toBe(SCHEMA_TABLES.USERS);
    expect(repo.knex).toBeDefined();
  });

  it("should use the provided knex instance if given", () => {
    const customKnex = vi.fn() as unknown as Knex.Knex;
    const repo = new DummyRepository(SCHEMA_TABLES.USERS, customKnex) as any;
    expect(repo.knex).toBe(customKnex);
  });

  it("should return a table query builder from table getter", () => {
    const repo = new DummyRepository(SCHEMA_TABLES.USERS);
    const table = repo.getTable();
    expect(table).toBeDefined();
  });

  it("should generate a valid uuid from uuid getter", () => {
    const repo = new DummyRepository(SCHEMA_TABLES.USERS);
    const uuid = repo.getUuid();
    expect(typeof uuid).toBe("string");
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("should work with SCHEMA_VIEWS as tableName", () => {
    const repo = new DummyRepository((SCHEMA_VIEWS as any).USER_VW) as any;
    expect(repo.tableName).toBe((SCHEMA_VIEWS as any).USER_VW);
  });
});
