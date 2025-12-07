import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const profileSlice = createApi({
  tagTypes: ["profile"],
  reducerPath: "profile",
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.recomind.site/api/Account",
  }),
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => {
        return {
          url: "/profile",
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.profile.map(({ id }) => ({
                type: "profile",
                id,
              })),
              { type: "profile", id: "LIST" },
            ]
          : [{ type: "profile", id: "LIST" }],
    }),
    deleteAccount: builder.mutation({ 
      query: (id) => ({
        url: `/${id}`,
        method: "Delete",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      }),
      invalidatesTags: [{ type: "profile", id: "LIST" }],
    }),
  }),
});

export const { useGetProfileQuery, useDeleteAccountMutation } = profileSlice;
