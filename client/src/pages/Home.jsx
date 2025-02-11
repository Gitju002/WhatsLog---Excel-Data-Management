import { columns } from "@/components/Chat/chat-columns";
import { DataTable } from "@/components/Chat/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, X } from "lucide-react";
import { useGetChatQuery } from "@/redux/slices/chatSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const search = searchParams.get("search") || "";
  const sortByDate = searchParams.get("sortByDate") === "true";
  const sortBySerialNumber = searchParams.get("sortBySerialNumber") === "true";

  const { data, isLoading, isFetching } = useGetChatQuery({
    areaOfInterest: search,
    modeOfCommunication: search,
    date: sortByDate ? "asc" : "desc",
    mobileNo: search,
    name: search,
    serialNumber: sortBySerialNumber ? "asc" : "desc",
    dateFrom,
    dateTo,
  });

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate(0);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Chat Records</h1>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <DatePicker
            className="border border-gray-300"
            placeholder="From Date"
            date={dateFrom ? new Date(dateFrom) : null}
            onChange={(date) => {
              const params = new URLSearchParams(searchParams);
              params.set("dateFrom", date.toISOString());
              setSearchParams(params);
            }}
          />
          <DatePicker
            className="border border-gray-300"
            placeholder="To Date"
            date={dateTo ? new Date(dateTo) : null}
            onChange={(date) => {
              const params = new URLSearchParams(searchParams);
              params.set("dateTo", date.toISOString());
              setSearchParams(params);
            }}
          />
          <Button
            onClick={handleResetFilters}
            className="bg-red-500 text-white"
          >
            Reset Filters
          </Button>
          <Button onClick={handleLogout} className="bg-red-500 text-white">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filters Section */}

      {/* Data Table */}
      <div className="mt-6 border border-gray-300 rounded-lg shadow-sm bg-white p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-gray-500" size={32} />
          </div>
        ) : (
          <DataTable columns={columns} data={data || []} />
        )}
      </div>
    </div>
  );
};

export default Home;
