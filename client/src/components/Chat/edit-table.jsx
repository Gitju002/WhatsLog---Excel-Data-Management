import React, { useEffect, useState } from "react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { Pen, X } from "lucide-react";
import { useUpdateChatMutation } from "@/redux/slices/chatSlice";
import toast from "react-hot-toast";

const userSchema = z.object({
  name: z.string().min(3, "Name is required"),
  mobileNo: z.string().min(10, "Mobile No must be at least 10 digits"),
  areaOfInterest: z.string().min(1, "Area of Interest is required"),
});

const EditTable = ({ id, close, chatData }) => {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const [updateChat] = useUpdateChatMutation();

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      mobileNo: "",
      areaOfInterest: "",
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (chatData) {
      reset({
        name: chatData.name || "",
        mobileNo: chatData.mobileNo || "",
        areaOfInterest: chatData.areaOfInterest || "",
      });
    }
  }, [chatData, reset]);

  const handleEdit = async (values) => {
    startTransition(async () => {
      try {
        await updateChat({ id, ...values }).unwrap();
        toast.success("Chat updated successfully!");
        close();
        navigate(0);
      } catch (error) {
        console.error("Failed to update chat:", error);
        toast.error("Failed to update chat!");
      }
    });
  };

  return (
    <AlertDialog open={Boolean(id)} onOpenChange={close}>
      <AlertDialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleEdit)}
            className="w-full max-w-md"
          >
            <Card>
              <AlertDialogCancel className="absolute right-10 top-10 border-none shadow-none">
                <X className="h-6 w-6" />
              </AlertDialogCancel>
              <CardHeader className="text-2xl font-semibold text-center">
                <CardTitle>Edit Chat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobileNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile No</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter your mobile number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="areaOfInterest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area of Interest</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter your area of interest"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Updating..." : "Edit"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditTable;
