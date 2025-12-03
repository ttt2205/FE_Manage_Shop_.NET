import dynamic from "next/dynamic";

const CustomerPage = dynamic(() => import("@/components/admin/customer"));

export default function CustomersPage() {
  return <CustomerPage />;
}
