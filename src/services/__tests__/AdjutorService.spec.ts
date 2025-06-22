import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "../../configs/env";
import {
  AdjutorBank,
  AdjutorBvnPayload,
  AdjutorKarmaPayload,
  AdjutorService,
} from "../AdjutorService";

vi.mock("axios");

const mockAxios = {
  create: vi.fn(),
  defaults: {},
  get: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn(),
    },
  },
  post: vi.fn(),
  put: vi.fn(),
};

describe("AdjutorService", () => {
  let service: AdjutorService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.create.mockReturnValue(mockAxios);
    service = new AdjutorService(mockAxios as unknown as typeof axios);
  });

  it("should call completeBvnVerification with correct params", async () => {
    const bvn = "12345678901";
    const otp = "123456";
    const mockResponse = {
      data: {
        data: {} as AdjutorBvnPayload,
        message: "ok",
        meta: { balance: 1, cost: 1 },
        status: "success",
      },
    };
    mockAxios.put.mockResolvedValueOnce(mockResponse);

    const result = await service.completeBvnVerification(bvn, otp);

    expect(mockAxios.put).toHaveBeenCalledWith(`/verification/bvn/${bvn}`, { otp });
    expect(result).toEqual(mockResponse.data);
  });

  it("should call getBanks and return banks", async () => {
    const mockBanks: AdjutorBank[] = [
      { longcode: "001", name: "Bank1", shortcode: "01" },
      { longcode: "002", name: "Bank2", shortcode: "02" },
    ];
    const mockResponse = {
      data: { data: mockBanks, message: "ok", meta: { balance: 1, cost: 1 }, status: "success" },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await service.getBanks();

    expect(mockAxios.get).toHaveBeenCalledWith("/banks");
    expect(result).toEqual(mockResponse.data);
  });

  it("should call initiateBvnConcent with correct params", async () => {
    const bvn = "12345678901";
    const contact = "test@example.com";
    const mockResponse = {
      data: { data: "reference", message: "ok", meta: { balance: 1, cost: 1 }, status: "success" },
    };
    mockAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await service.initiateBvnConcent(bvn, contact);

    expect(mockAxios.post).toHaveBeenCalledWith(`/verification/bvn/${bvn}`, { contact });
    expect(result).toEqual(mockResponse.data);
  });

  it("should call karmaLookup with identity '00000000000' and use httpClient.get", async () => {
    const identity = "00000000000";
    const mockPayload = {} as AdjutorKarmaPayload;
    const mockResponse = {
      data: { data: mockPayload, message: "ok", meta: { balance: 1, cost: 1 }, status: "success" },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await service.karmaLookup(identity);

    expect(mockAxios.get).toHaveBeenCalledWith(`/verification/karma/${identity}`);
    expect(result).toEqual(mockResponse.data);
  });

  it("should call karmaLookup with identity not '00000000000' and return mocked response", async () => {
    const identity = "12345678901";
    const result = await service.karmaLookup(identity);

    expect(result).toEqual({
      data: null,
      message: "Successful",
      meta: { balance: 1600, cost: 10 },
      status: "success",
    });
  });

  it("should set up request interceptor with correct headers", () => {
    // Re-instantiate to trigger constructor logic
    const useSpy = vi.fn((cb) => cb({ headers: {}, validateStatus: undefined }));
    const axiosInstance = {
      defaults: {},
      interceptors: { request: { use: useSpy } },
    } as unknown as Axios.AxiosInstance;
    new AdjutorService(axiosInstance);

    expect(useSpy).toHaveBeenCalled();
    const config = useSpy.mock.calls[0][0]({ headers: {} });
    expect(config.headers.Authorization).toBe(`Bearer ${env.ADJUTOR_API_KEY}`);
    expect(config.headers["Content-Type"]).toBe("application/json");
    expect(typeof config.validateStatus).toBe("function");
  });

  it("should throw an error when completeBvnVerification receives a 500 status code", async () => {
    const bvn = "12345678901";
    const otp = "123456";
    // Simulate axios rejecting on 500 because validateStatus returns false
    const error = Object.assign(new Error("Request failed with status code 500"), {
      isAxiosError: true,
      response: { data: { message: "Internal Server Error" }, status: 500 },
    });
    mockAxios.put.mockRejectedValueOnce(error);

    await expect(service.completeBvnVerification(bvn, otp)).rejects.toThrow(
      "Request failed with status code 500",
    );
    expect(mockAxios.put).toHaveBeenCalledWith(`/verification/bvn/${bvn}`, { otp });
  });

  it("should throw an error when getBanks receives a 500 status code", async () => {
    const error = Object.assign(new Error("Request failed with status code 500"), {
      isAxiosError: true,
      response: { data: { message: "Internal Server Error" }, status: 500 },
    });
    mockAxios.get.mockRejectedValueOnce(error);

    await expect(service.getBanks()).rejects.toThrow("Request failed with status code 500");
    expect(mockAxios.get).toHaveBeenCalledWith("/banks");
  });
});
