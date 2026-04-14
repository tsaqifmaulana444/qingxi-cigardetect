import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
   <div>
    <aside className="bg-amber-500 w-[19%] h-[100vh]">
      <div className="flex">
        <h1>Rotect</h1>
        <Image   
          src="/logo.png" 
          alt="logo"
          width={30} 
          height={30}
        />
      </div>
      <div className="flex flex-col">
        <Link href={"/"}>Dashboard</Link>
        <Link href={"/create"}>Add Data</Link>
        <Link href={"/export"}>Export</Link>
        <Link href={"/logout"}>Log Out</Link>
      </div>
    </aside>
   </div>
  );
}
