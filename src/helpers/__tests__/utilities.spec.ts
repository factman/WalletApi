import { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { gracefulShutdown } from "../utilities";

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
