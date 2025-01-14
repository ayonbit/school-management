import Announcement from "@/app/components/Announcement";
import AttendanceChart from "@/app/components/AttendanceChart";
import CountChart from "@/app/components/CountChart";
import EventCalendar from "@/app/components/EventCalendar";
import FinanceChart from "@/app/components/FinanceChart";
import UserCard from "@/app/components/UserCard";

const AdminPage = () => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="flex flex-col gap-8 w-full lg:w-2/3">
        {/*User Card*/}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="student" />
          <UserCard type="teacher" />
          <UserCard type="parent" />
          <UserCard type="staff" />
        </div>
        {/*Charts*/}
        <div className=" flex gap-4 flex-col lg:flex-row">
          {/*Middle chart*/}
          {/*Count Chart*/}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChart />
          </div>
          {/*Attendance Chart*/}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChart />
          </div>
        </div>
        <div className="w-full h-[500px]">
          {/*Bottom chart*/}
          <FinanceChart />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcement />
      </div>
    </div>
  );
};

export default AdminPage;
