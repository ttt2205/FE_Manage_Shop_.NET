import ProductPage from "@/components/admin/product";
import dynamic from "next/dynamic";

const index = () => {
  return <ProductPage />;
};

export default dynamic(() => Promise.resolve(index));
