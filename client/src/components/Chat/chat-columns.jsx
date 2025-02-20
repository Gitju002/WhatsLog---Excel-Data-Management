import { Button } from "../ui/button";
import { ArrowUpDown, Pen } from "lucide-react";
import EditTable from "./edit-table";
import DeleteTable from "./delete-table";
import { useState } from "react";
import { useRole } from "@/hooks/use-role";

const Actions = ({ row }) => {
  const role = useRole();
  const [selectedId, setSelectedId] = useState(null);
  const [chatData, setChatData] = useState(null);

  if (role === "user") return null;

  return (
    <div className="flex items-center space-x-2">
      <Button
        size="icon"
        className="h-8 w-8 bg-green-500"
        onClick={() => {
          setSelectedId(row.original._id);
          setChatData(row.original);
        }}
      >
        <Pen className="h-4 w-4" />
      </Button>

      <DeleteTable id={row.original._id} chatData={row.original} />

      {selectedId && (
        <EditTable
          id={selectedId}
          chatData={chatData}
          close={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

// Function to generate columns dynamically based on role
export const getColumns = (role) => {
  const columns = [
    {
      accessorKey: "serialNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          SL No.
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
        return formattedDate;
      },
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "mobileNo",
      header: "Mobile No.",
    },
    {
      accessorKey: "stream",
      header: "Stream",
    },
    {
      accessorKey: "areaOfInterest",
      header: "Area of Interest",
    },
    {
      accessorKey: "modeOfCommunication",
      header: "Mode of Communication",
    },
  ];

  // Add the "Actions" column only if the role is not "user"
  if (role !== "user") {
    columns.push({
      header: <strong className="text-black">Actions</strong>,
      id: "_id",
      cell: ({ row }) => <Actions row={row} />,
    });
  }

  return columns;
};
