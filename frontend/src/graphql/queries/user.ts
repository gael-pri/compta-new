import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      username
      description
      image
      created_at
      role
      birthday
      gender
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query getUserById($id: Float!) {
    getUserById(id: $id) {
      id
      firstName
      lastName
      username
      description
      email
      image
      birthday
      gender
      created_at
      role
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      firstName
      lastName
      username
      description
      email
      image
      birthday
      gender
      created_at
      role
    }
  }
`;


