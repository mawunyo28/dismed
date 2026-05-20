"use client"

import { useState } from "react"
import { Pill, AlertTriangle, Clock, Grid3X3, Search, Filter, Download, Plus, Pencil, Trash2, ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { medications, type MedicationStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function getStatusBadge(status: MedicationStatus) {
  switch (status) {
    case "Active":
      return <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
    case "Low Stock":
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Low Stock</Badge>
    case "Expired":
      return <Badge variant="destructive">Expired</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function MedicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const activeMeds = medications.filter((m) => m.status === "Active").length
  const lowStock = medications.filter((m) => m.status === "Low Stock").length
  const expired = medications.filter((m) => m.status === "Expired").length
  const usedSlots = medications.length
  const totalSlots = 10

  const filteredMeds = medications.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Medication Management</h1>
          <p className="text-muted-foreground">Monitor prescriptions, inventory levels, and dispenser compartment mappings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Export Ledger
          </Button>
          <Button>
            <Plus className="mr-2 size-4" />
            Add Medication
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Pill className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Medications</p>
              <p className="text-2xl font-bold">{activeMeds}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100">
              <AlertTriangle className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
              <p className="text-2xl font-bold">{lowStock}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
              <Clock className="size-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expired Items</p>
              <p className="text-2xl font-bold text-red-600">{expired}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Grid3X3 className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Free Compartments</p>
              <p className="text-2xl font-bold">{totalSlots - usedSlots} / {totalSlots}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Active Inventory</CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search medications..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="size-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Slot</TableHead>
                <TableHead>Medication Details</TableHead>
                <TableHead>Dosage & Frequency</TableHead>
                <TableHead>Pill Count / Capacity</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeds.map((med) => {
                const fillPercent = (med.pillCount / med.capacity) * 100
                return (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.slot}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {med.slot}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit">{med.dosage}</Badge>
                        <span className="text-sm text-muted-foreground">{med.frequency}</span>
                        {med.nextDose && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            Next: {med.nextDose}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">
                          <strong>{med.pillCount} left</strong> / {med.capacity}
                        </span>
                        <Progress 
                          value={fillPercent} 
                          className={cn(
                            "h-2",
                            fillPercent < 20 && "bg-red-100 [&>div]:bg-red-500",
                            fillPercent >= 20 && fillPercent < 50 && "bg-amber-100 [&>div]:bg-amber-500"
                          )}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-muted-foreground" />
                          {med.expiry}
                        </span>
                        {med.status === "Expired" && (
                          <span className="text-xs font-medium text-red-600">Dispose Immediately</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(med.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="size-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredMeds.length} of {medications.length} medications registered.</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Accordion type="single" collapsible className="rounded-lg border bg-card">
        <AccordionItem value="refill" className="border-none px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-muted-foreground" />
              <span>How to refill compartments safely?</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ol className="ml-6 list-decimal space-y-2">
              <li>Ensure the dispenser is in &quot;Maintenance Mode&quot; from the Device Control screen.</li>
              <li>Open the top lid using the physical release button or app unlock.</li>
              <li>Remove any remaining pills and clean the compartment with a dry cloth.</li>
              <li>Place the new medication in the correct slot, ensuring proper orientation.</li>
              <li>Close the lid and run a &quot;Compartment Verification&quot; test.</li>
              <li>Update the medication inventory count in the system.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
