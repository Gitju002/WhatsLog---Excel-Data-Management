import { apiSlice } from "./apiSlice";

const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChat: builder.query({
      query: ({
        date,
        serialNumber,
        name,
        mobileNo,
        areaOfInterest,
        modeOfCommunication,
        dateFrom,
        dateTo,
      }) => {
        const params = {};

        if (date) params.date = date;
        if (serialNumber) params.serialNumber = serialNumber;
        if (name) params.name = name;
        if (mobileNo) params.mobileNo = mobileNo;
        if (areaOfInterest) params.areaOfInterest = areaOfInterest;
        if (modeOfCommunication)
          params.modeOfCommunication = modeOfCommunication;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;

        return {
          url: `/chats/all`,
          params,
        };
      },
      providesTags: ["Chat"],
    }),
    getChatById: builder.query({
      query: (id) => `/chats/${id}`,
      providesTags: ["Chat"],
    }),
    updateChat: builder.mutation({
      query: ({ id, name, mobileNo, areaOfInterest }) => ({
        url: `/chats/update/${id}`,
        method: "PUT",
        body: { name, mobileNo, areaOfInterest },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
      invalidatesTags: ["Chat"],
    }),
    bulkSaveChats: builder.mutation({
      query: (data) => ({
        url: "/chats/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),
    deleteChat: builder.mutation({
      query: (id) => ({
        url: `/chats/${id}`,
        method: "DELETE",

        invalidatesTags: ["Chat"],
      }),
    }),
  }),
});

export const {
  useGetChatQuery,
  useUpdateChatMutation,
  useDeleteChatMutation,
  useBulkSaveChatsMutation,
  useGetChatByIdQuery,
} = chatApiSlice;

export default chatApiSlice;
