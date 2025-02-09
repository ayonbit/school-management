import Announcement from "@/app/components/Announcement";
import AttendanceChartContainer from "@/app/components/AttendanceChartContainer";
import CountChartContainer from "@/app/components/CountChartContainer";
import EventCalendarContainer from "@/app/components/EventCalendarContainer";
import FinanceChart from "@/app/components/FinanceChart";
import UserCard from "@/app/components/UserCard";

const AdminPage = ({ searchParams }) => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT SECTION */}
      <div className="flex flex-col gap-8 w-full lg:w-2/3">
        {/* User Cards */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="student" />
          <UserCard type="teacher" />
          <UserCard type="parent" />
          <UserCard type="admin" />
        </div>

        {/* Charts Section */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Count Chart */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartContainer />
          </div>
          {/* Attendance Chart */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>

        {/* Finance Chart */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={searchParams} />
        <Announcement />
      </div>
    </div>
  );
};

export default AdminPage;
