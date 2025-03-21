import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import StudentResultCard from "@/components/StudentResultCard";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {  Branch, Student, Result, Subject } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CharacterCertificate from "@/components/charactercertificate";
import MigrationCertificate from "@/components/migrationcertificate"
import MarksSheetCertificate from "@/components/Marksheet";
import DiplomaGenerator from "@/components/diplomait";
  import TranscriptCertificate from "@/components/transcript";
const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const student:
    | (Student & {
        branch: Branch & { _count: { lectures: number } };
        semester: { id: number; level: number };
        results: (Result & { subject: Subject })[];
      })
    | null = await prisma.student.findUnique({
    where: { id },
    include: {
      branch: { include: { _count: { select: { lectures: true } } } },
      semester: true,
      results: {
        include: { subject: true },
      }
    },
  });

  if (!student) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={student.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {student.name}
                </h1>
                
                {role === "admin" || role === "registrar" && (
                  <FormContainer table="student" type="update" data={student} />
                )}
              </div>
              <p className="text-sm text-gray-500">
              The username of student is {student.username}.
              Studying in Branch {student.branch.name} {""}
              In Semester {student.semester.level}. 
              Father's Name: {student.fatherName}.<br/>
              Mother's Name: {student.motherName}.
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>{student.bloodType}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("en-GB").format(student.birthday)}
                  </span>
                </div>
              </div>  
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  {student.email}
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  {student.phone}
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            {/* <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <Suspense fallback="loading...">
                <StudentAttendanceCard id={student.id} />
              </Suspense>
            </div> */}
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <span className="text-sm text-gray-400">Semester</span>
                <h1 className="text-xl font-semibold">
                  {student.semester.level}
                </h1>
              </div>
            </div>
            {/* CARD */}
           
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">{student.branch.name}</h1>
                <span className="text-sm text-gray-400">Branch</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1 className="text-xl center">Student&apos;s Results</h1>
          {/* <BigCalendarContainer type="branchId" id={student.branch.id} /> */}
          <StudentResultCard student={student} results={student.results} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            {/* <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/lectures?branchId=${student.branch.id}`}
            >
              Student&apos;s Lectures
            </Link> */}
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/teachers?branchId=${student.branch.id}`}
            >
              Student&apos;s Teachers
            </Link>
            <CharacterCertificate student={student} />
            <MigrationCertificate student={student} />
            <MarksSheetCertificate student={student} />
            <DiplomaGenerator student={student}/>
            <TranscriptCertificate student={student}/>
            {/* <Link
              className="p-3 rounded-md bg-pink-50"
              href={`/list/exams?branchId=${student.branch.id}`}
            >
              Student&apos;s Exams
            </Link> */}
           
            <Link
              className="p-3 rounded-md bg-lamaYellowLight"
              href={`/list/results?studentId=${student.id}`}
            >
              Student&apos;s Results
            </Link>
          </div>
        </div>
        {/* <Performance /> */}
        <Announcements />
      </div>
    </div>
  );
};

export default SingleStudentPage;
