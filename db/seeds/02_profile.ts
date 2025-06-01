import Knex from "knex";

export async function seed(knex: Knex.Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("profiles").del();

  // Inserts seed entries
  await knex("profiles").insert({
    address: "123 Main St, Lagos, Nigeria",
    bvn: "22123456789",
    bvn_email: "wunmi@yahoo.com",
    bvn_phone: "08012345678",
    bvnMetadata: JSON.stringify({
      base64Image: null,
      bvn: "22123456789",
      dob: "1990-10-31",
      email: "wunmi@yahoo.com",
      enrollment_bank: "044",
      enrollment_branch: "RET SHOP - BABCOCK UNIVERSITY (137)",
      first_name: "ADO",
      formatted_dob: "1990-10-31",
      gender: "Male",
      image_url: "https://picsum.photos/id/1/5000/3333",
      last_name: "SULE",
      level_of_account: null,
      lga_of_origin: "Abeokuta South",
      lga_of_residence: "Abeokuta South",
      marital_status: "Single",
      middle_name: "JOHN",
      mobile: "08012345678",
      mobile2: null,
      name_on_card: "ADO JOHN SULE",
      nationality: null,
      nin: null,
      reference: 10000001,
      registration_date: "30-Mar-2015",
      residential_address: "Ogun State",
      state_of_origin: "Ogun State",
      state_of_residence: "Ogun State",
      watchlisted: 0,
    }),
    createdAt: new Date(),
    dob: "1990-10-31",
    firstName: "ADO",
    gender: "Male",
    id: "00000000-0000-0000-0000-000000000002",
    image: "https://picsum.photos/id/1/5000/3333",
    lastName: "SULE",
    middleName: "JOHN",
    state: "Ogun State",
    updatedAt: new Date(),
    userId: "00000000-0000-0000-0000-000000000001",
  });
}
