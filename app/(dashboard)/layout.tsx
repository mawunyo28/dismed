import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (


    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
