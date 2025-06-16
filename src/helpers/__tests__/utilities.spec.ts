import bcrypt from "bcryptjs";
import { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  generateSessionId,
  getPaginationOffset,
  getPaginationTotalPages,
  gracefulShutdown,
  hashPassword,
  hashPin,
} from "../utilities.js";

describe("gracefulShutdown", () => {
  let server: Server;
  let closeMock: ReturnType<typeof vi.fn>;
  let processOnSpy = vi.spyOn(process, "on");
  let originalExitCode = process.exitCode;

  beforeEach(() => {
    closeMock = vi.fn((cb: (arg: unknown) => void) => {
      cb(undefined);
    });
    server = { close: closeMock } as unknown as Server;
    processOnSpy = vi.spyOn(process, "on");
    originalExitCode = process.exitCode;
    process.exitCode = undefined;
    vi.spyOn(console, "log").mockImplementation(() => {
      /* no-op */
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = originalExitCode;
  });

  it("registers SIGINT and SIGTERM listeners", () => {
    gracefulShutdown(server);
    expect(processOnSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
  });

  it("calls server.close and logs success on shutdown", () => {
    gracefulShutdown(server);

    // Find the registered listener
    const listener =
      processOnSpy.mock.calls.find(([signal]) => signal === "SIGINT")?.[1] ??
      async function () {
        /* no-op */
      };

    listener();

    expect(closeMock).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("Server closed successfully");
    expect(process.exitCode).toBe(0);
    expect(console.log).toHaveBeenCalledWith("Graceful shutdown initiated. Exiting process...");
  });

  it("logs error if server.close returns error", () => {
    const error = new Error("fail");
    error.name = "CloseError";
    closeMock = vi.fn((cb: (arg: unknown) => unknown) => cb(error));
    server = { close: closeMock } as unknown as Server;

    gracefulShutdown(server);

    const listener =
      processOnSpy.mock.calls.find(([signal]) => signal === "SIGINT")?.[1] ??
      async function () {
        /* no-op */
      };

    listener();

    expect(console.log).toHaveBeenCalledWith("Error closing server:", "CloseError", "fail");
  });

  it("calls cleanUp if provided", () => {
    const cleanUp = vi.fn().mockResolvedValue(undefined);
    gracefulShutdown(server, cleanUp);

    const listener =
      processOnSpy.mock.calls.find(([signal]) => signal === "SIGINT")?.[1] ??
      async function () {
        /* no-op */
      };

    listener();

    expect(cleanUp).toHaveBeenCalled();
  });

  it("does not throw if cleanUp is not provided", () => {
    gracefulShutdown(server);

    const listener =
      processOnSpy.mock.calls.find(([signal]) => signal === "SIGINT")?.[1] ??
      async function () {
        /* no-op */
      };

    listener();
    expect(server.close).toHaveBeenCalled();
  });
});

describe("generateSessionId", () => {
  it("returns a string of expected length and format", () => {
    const sessionId = generateSessionId();
    expect(typeof sessionId).toBe("string");
    expect(sessionId.length).toBeGreaterThanOrEqual(26); // institutionCode(6) + dateTime(12) + serial(6) + random(6)
    expect(sessionId.startsWith("000000")).toBe(true);
  });

  it("returns different values on subsequent calls", () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).not.toBe(id2);
  });
});

describe("getPaginationOffset", () => {
  it("returns correct offset for given page and limit", () => {
    expect(getPaginationOffset(1, 10)).toBe(0);
    expect(getPaginationOffset(2, 10)).toBe(10);
    expect(getPaginationOffset(3, 5)).toBe(10);
  });
});

describe("getPaginationTotalPages", () => {
  it("returns correct total pages", () => {
    expect(getPaginationTotalPages(100, 10)).toBe(10);
    expect(getPaginationTotalPages(101, 10)).toBe(11);
    expect(getPaginationTotalPages(0, 10)).toBe(0);
    expect(getPaginationTotalPages(10, 3)).toBe(4);
  });
});

describe("hashPassword", () => {
  it("returns a bcrypt hash of the password", async () => {
    const password = "mySecret123";
    const hash = await hashPassword(password);
    expect(typeof hash).toBe("string");
    expect(hash).not.toBe(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });
});

describe("hashPin", () => {
  it("returns a bcrypt hash of the pin", async () => {
    const pin = "1234";
    const hash = await hashPin(pin);
    expect(typeof hash).toBe("string");
    expect(hash).not.toBe(pin);
    expect(await bcrypt.compare(pin, hash)).toBe(true);
  });
});
