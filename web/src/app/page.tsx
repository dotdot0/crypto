import { Card } from "@mui/material";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-black">
      <Image
        src="/img/logo.svg"
        width={400}
        height={400}
        alt="this is our logo"
      />
      <h1 className="m-2 text-7xl text-white">VeriDoc</h1>
      <h2 className="m-2 text-xl text-center max-w-4xl text-white">
        VeriDoc is a web application designed to simplify the process of
        uploading, processing, and managing PDF documents. The application
        utilizes the Next framework, Redux for state management, and
        Material-UI for responsive design components, providing users with a
        sleek and user-friendly interface.
      </h2>
      <button className="m-6 text-xl bg-white h-10 text-black w-1/3 rounded-md">
        <Link href="/dashboard">Start</Link>
      </button>
    </div>
  );
}
