import { gql } from "@apollo/client";

export const GET_ALL_FEATURES = gql`
  query Features {
    features {
      id
      icon
      title
      description
      category
    }
  }
`;