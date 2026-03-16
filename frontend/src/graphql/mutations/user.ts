import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        username
        firstName
        lastName
        email
      }
    }
  }
`;

export const CREATE_ACCOUNT_MUTATION = gql`
  mutation CreateAccount($data: CreateAccountInput!) {
    createAccount(data: $data) {
      id
      email
      firstName
      lastName
      username
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($data: UpdateUserInput!) {
    updateUser(data: $data) {
      id
      email
      firstName
      lastName
      username
      birthday
      gender
      image
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($data: DeleteUserInput!) {
    deleteUser(data: $data) {
      id
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;
