import { apiSlice } from "./apiSlice";
import { useNavigate } from "react-router-dom";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    getProfile: builder.query({
      query: () => {
        const token = localStorage.getItem("token");
        if (!token) {
          const navigate = useNavigate();
          navigate("/login");
          return;
        }
        return {
          url: "/auth/me",
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useGetProfileQuery } = authApiSlice;
