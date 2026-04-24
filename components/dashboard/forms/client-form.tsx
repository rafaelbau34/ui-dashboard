"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClientSchema, type ClientInput } from "@/lib/validations";
import { createClient, updateClient } from "@/lib/actions/client.actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export interface ClientFormProps {
  client?: ClientInput & { id: number };
  onSuccess?: () => void;
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ClientInput>({
    resolver: zodResolver(ClientSchema),
    defaultValues: client || {
      name: "",
      email: "",
      phone: "",
    },
  });

  function onSubmit(values: ClientInput) {
    startTransition(async () => {
      try {
        let res;
        if (client) {
          res = await updateClient(client.id, values);
        } else {
          res = await createClient(values);
        }
        
        if (res?.error) {
          form.setError("email", { message: res.error });
          return;
        }

        form.reset();
        onSuccess?.();
      } catch (error) {
        console.error("Failed to save client:", error);
        form.setError("root", { message: "An unexpected error occurred." });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Acme Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contact@acme.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="E.g., 555-0100" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : client ? "Update Client" : "Create Client"}
        </Button>
      </form>
    </Form>
  );
}
