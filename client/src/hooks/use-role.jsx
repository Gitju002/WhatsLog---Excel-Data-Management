import { useGetProfileQuery } from "@/redux/slices/authApiSlice";



export const useRole = () => {
    const { data, isLoading, isFetching } = useGetProfileQuery();
    if (isLoading || isFetching) return "loading";
    return data?.user?.role;
} 