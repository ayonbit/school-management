// import prisma from "../lib/prisma";
// import FormModal from "./FormModal";

// const FormContainer = async ({ table, type, data, id }) => {
//   let relatedData = {};

//   if (type !== "delete") {
//     try {
//       switch (table) {
//         case "subject":
//           relatedData.teachers = await prisma.teacher.findMany({
//             select: { id: true, name: true },
//           });
//           break;

//         case "class":
//           relatedData.teachers = await prisma.teacher.findMany({
//             select: { id: true, name: true },
//           });
//           relatedData.grades = await prisma.grade.findMany({
//             select: { id: true, level: true },
//           });
//           break;

//         case "teacher":
//           relatedData.subjects = await prisma.subject.findMany({
//             select: { id: true, name: true },
//           });
//           break;

//         default:
//           break;
//       }
//     } catch (error) {
//       console.error("Error fetching related data:", error);
//     }
//   }

//   return (
//     <div>
//       <FormModal
//         table={table}
//         type={type}
//         data={data}
//         id={id}
//         relatedData={relatedData}
//       />
//     </div>
//   );
// };

// export default FormContainer;
