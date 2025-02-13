import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "ixhuf5b5",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});