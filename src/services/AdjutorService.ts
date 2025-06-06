import axios from "axios";

import { env } from "../configs/env.js";

export interface AdjutorBank {
  longcode: string;
  name: string;
  shortcode: null | string;
}

export interface AdjutorBvnPayload {
  base64Image: null | string;
  bvn: string;
  dob: string;
  email: string;
  enrollment_bank: string;
  enrollment_branch: string;
  first_name: string;
  formatted_dob: string;
  gender: string;
  image_url: string;
  last_name: string;
  level_of_account: null | string;
  lga_of_origin: string;
  lga_of_residence: string;
  marital_status: string;
  middle_name: string;
  mobile: string;
  mobile2: null | string;
  name_on_card: string;
  nationality: null | string;
  nin: null | string;
  reference: number;
  registration_date: string;
  residential_address: string;
  state_of_origin: string;
  state_of_residence: string;
  watchlisted: number;
}

export interface AdjutorKarmaPayload {
  amount_in_contention: string;
  default_date: string;
  karma_identity: string;
  karma_identity_type: {
    identity_type: string;
  };
  karma_type: {
    karma: string;
  };
  reason: null | string;
  reporting_entity: {
    email: string;
    name: string;
  };
}

interface AdjutorResponse<T = unknown> {
  data: T;
  message: string;
  meta: {
    balance: number;
    cost: number;
  };
  status: string;
}

export class AdjutorService {
  private httpClient: Axios.AxiosInstance;

  constructor(axiosInstance = axios.create({ ...axios.defaults, baseURL: env.ADJUTOR_API_URL })) {
    this.httpClient = axiosInstance;
    this.httpClient.interceptors.request.use((config) => {
      config.headers = {
        Authorization: `Bearer ${env.ADJUTOR_API_KEY}`,
        "Content-Type": "application/json",
      };
      config.validateStatus = function (status: number) {
        return status < 500;
      };
      return config;
    });
  }

  async completeBvnVerification(bvn: string, otp: string) {
    return (
      await this.httpClient.put<AdjutorResponse<AdjutorBvnPayload>>(`/verification/bvn/${bvn}`, {
        otp,
      })
    ).data;
  }

  async getBanks() {
    return (await this.httpClient.get<AdjutorResponse<AdjutorBank[]>>("/banks")).data;
  }

  async initiateBvnConcent(bvn: string, contact: string) {
    return (
      await this.httpClient.post<AdjutorResponse<string>>(`/verification/bvn/${bvn}`, { contact })
    ).data;
  }

  async karmaLookup(identity: string) {
    return (
      await this.httpClient.get<AdjutorResponse<AdjutorKarmaPayload>>(
        `/verification/karma/${identity}`,
      )
    ).data;
  }
}
