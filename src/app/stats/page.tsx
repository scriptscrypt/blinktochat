import { CompBarChart } from "@/components/BarChart";
import { CompBreadCrumb } from "@/components/BreadCrumb";

export default function Page() {
  return (
    <>
      <div className="flex flex-col gap-4 mx-16 my-16">
        <div className="my-2">
          <CompBreadCrumb />
        </div>
        <CompBarChart />
      </div>
    </>
  );
}
