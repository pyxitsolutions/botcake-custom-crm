import { Header } from "@/components/layout/header";
import { CustomersTable } from "@/components/customers/customers-table";
import { getCustomers } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <>
      <Header
        title="Customers"
        description="View and search all customers"
      />
      <div className="p-4 sm:p-8">
        <CustomersTable customers={customers} />
      </div>
    </>
  );
}
