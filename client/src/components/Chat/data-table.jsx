import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { FileDown, FileText, FileUp, Search } from "lucide-react";
import { Button } from "../ui/button";
import { useBulkSaveChatsMutation } from "@/redux/slices/chatSlice";
import toast from "react-hot-toast";

export function DataTable({ columns, data }) {
  const fileInputRef = useRef(null);
  const [sorting, setSorting] = useState([]);
  const [bulkSaveChats] = useBulkSaveChatsMutation();
  const [isImporting, setIsImporting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [searchField, setSearchField] = useState(search);
  const navigate = useNavigate();

  useEffect(() => {
    const debouncedSearch = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchField === search) return;
      if (searchField === "") {
        params.delete("search");
      } else {
        params.set("search", searchField);
      }
      setSearchParams(params);
    }, 300);
    return () => clearTimeout(debouncedSearch);
  }, [search, searchField, searchParams, setSearchParams]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const convertToPDF = () => {
    const doc = new jsPDF();

    const currentData = data || [];

    const formattedData = currentData.map((item) => [
      item.serialNumber,
      format(new Date(item.date), "dd/MM/yyyy"),
      item.name,
      item.mobileNo,
      item.areaOfInterest,
      item.modeOfCommunication,
    ]);

    doc.text("Chat Data", 14, 10);

    autoTable(doc, {
      head: [
        [
          "Serial Number",
          "Date",
          "Name",
          "Mobile No",
          "Area of Interest",
          "Mode of Communication",
        ],
      ],
      body: formattedData,
      startY: 20,
    });

    doc.save("chat-data.pdf");
  };
  const exportToExcel = () => {
    const currentData = data;
    const formattedData = currentData.map((item) => ({
      "Sl. No.": item.serialNumber,
      Date: format(new Date(item.date), "dd/MM/yyyy"),
      Name: item.name,
      Stream: item.stream,
      mobileNo: item.mobileNo,
      "Area of Interest": item.areaOfInterest,
      "Mode of Communication": item.modeOfCommunication,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chat Data");
    XLSX.writeFile(wb, "chat-data.xlsx");
  };

  const mapExcelToApiFormat = (data) => {
    return data.map((item, index) => {
      let formattedDate = "";

      if (item["Date"]) {
        const dateParts = item["Date"].split("/");
        if (dateParts.length === 3) {
          formattedDate = `${dateParts[2]}-${dateParts[1].padStart(
            2,
            "0"
          )}-${dateParts[0].padStart(2, "0")}`;
        }
      }

      console.log("item", item);
      const mobileNo = item["mobileNo"]

        ? item["mobileNo"].toString().trim()
        : "";

      return {
        serialNumber: index + 1,
        date: formattedDate || "",
        name: item["Name"] || "",
        mobileNo: mobileNo,
        stream: item["Stream"] || "",
        areaOfInterest: item["Area of Interest"] || "",
        modeOfCommunication: item["Mode of Communication"] || "N/A",
      };
    });
  };

  const importExcel = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        alert("Please upload an Excel file");
        return;
      }

      const reader = new FileReader();
      setIsImporting(true);

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result || []);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          const formattedData = mapExcelToApiFormat(jsonData);
          const missingMobileNo = formattedData.filter(
            (item) => !item.mobileNo
          );

          if (missingMobileNo.length) {
            console.warn("Entries missing mobileNo:", missingMobileNo);
          }

          const response = await bulkSaveChats(formattedData);

          if ("error" in response) {
            console.error("API Error:", response.error);
            alert("Failed to import data. Please check the file format.");
          } else {
            setTimeout(() => {
              toast.success("Data imported successfully.");
            }, 2000);
            navigate(0);
          }
        } catch (error) {
          console.error("Unexpected error:", error);
        } finally {
          setIsImporting(false);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };


  return (
    <div className="rounded-md ">
      <div className="flex items-center justify-between ">
        <div className="relative  rounded-md shadow-sm w-1/3 mb-6 ">
          <Input
            placeholder="Search by Name or Mobile No.
"
            className="pr-10 border  border-gray-300 focus-visible:ring-0"
            value={searchField}
            onChange={(e) => {
              setSearchField(e.target.value);
            }}
          />
          <Search className="absolute top-1/2 right-4 transform -translate-y-1/2 text-slate-400" />
        </div>
        <div className="flex gap-2 -mt-5">
          <div>
            <input
              ref={fileInputRef}
              aria-label="Upload File"
              type="file"
              id="file"
              className="hidden"
              onChange={importExcel}
            />
            <Button
              type="button"
              size={"icon"}
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              <FileUp size={16} />
            </Button>
          </div>

          <Button type="button" size={"icon"} onClick={exportToExcel}>
            <FileDown size={16} />
          </Button>
          <Button type="button" size={"icon"} onClick={convertToPDF}>
            <FileText size={16} />
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
