import * as React from "react"
import { toast } from "sonner"
import { MoonIcon, SunIcon } from "lucide-react"

import { brand } from "@/brand.config"
import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Starter showcase: every core component rendered with the brand tokens.
// Replace sections with real pattern pages as the system grows.

const ROLES = [
  ["primary", "primary-foreground"],
  ["secondary", "secondary-foreground"],
  ["muted", "muted-foreground"],
  ["accent", "accent-foreground"],
  ["destructive", "background"],
  ["card", "card-foreground"],
] as const

const TYPE = [
  ["Display", "text-5xl font-semibold tracking-tight"],
  ["Headline", "text-3xl font-semibold tracking-tight"],
  ["Title", "text-xl font-medium"],
  ["Body", "text-base"],
  ["Label", "text-sm font-medium"],
  ["Caption", "text-xs text-muted-foreground"],
] as const

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} data-section className="scroll-mt-20 space-y-5 py-10">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function App() {
  const { theme, setTheme } = useTheme()
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-heading text-lg font-semibold">{brand.name}</p>
            <p className="text-xs text-muted-foreground">{brand.tagline}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl divide-y px-6">
        <Section id="color" title="Color">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ROLES.map(([bg, fg]) => (
              <div
                key={bg}
                className="flex h-24 flex-col justify-end rounded-lg border p-3 text-sm font-medium"
                style={{
                  background: `var(--${bg})`,
                  color: `var(--${fg})`,
                }}
              >
                {bg}
              </div>
            ))}
          </div>
        </Section>

        <Section id="type" title="Type">
          <div className="space-y-3">
            {TYPE.map(([name, cls]) => (
              <div key={name} className="flex items-baseline gap-6">
                <span className="w-20 shrink-0 text-xs text-muted-foreground">
                  {name}
                </span>
                <span className={cls}>The quick brown fox</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="buttons" title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        <Section id="forms" title="Form fields">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Ada Lovelace" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                defaultValue="ada@"
                aria-invalid
                aria-describedby="email-error"
              />
              <p id="email-error" className="text-sm text-destructive">
                Enter a full email address, like ada@example.com
              </p>
            </div>
            <div className="space-y-2">
              <Label>Service</Label>
              <Select defaultValue="one">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one">Option one</SelectItem>
                  <SelectItem value="two">Option two</SelectItem>
                  <SelectItem value="three">Option three</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Anything we should know?" />
            </div>
          </div>
        </Section>

        <Section id="selection" title="Selection controls">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id="c1" defaultChecked />
                <Label htmlFor="c1">Send reminders</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="c2" />
                <Label htmlFor="c2">Marketing emails</Label>
              </div>
            </div>
            <RadioGroup defaultValue="a">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="a" id="r1" />
                <Label htmlFor="r1">Pay now</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="b" id="r2" />
                <Label htmlFor="r2">Pay later</Label>
              </div>
            </RadioGroup>
            <div className="flex items-center gap-2">
              <Switch id="s1" defaultChecked />
              <Label htmlFor="s1">Notifications</Label>
            </div>
          </div>
        </Section>

        <Section id="cards" title="Cards">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card title</CardTitle>
                <CardDescription>Supporting text for the card.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">Ada Lovelace</p>
                  <p className="text-muted-foreground">2 upcoming</p>
                </div>
                <Badge className="ml-auto">New</Badge>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="outline">
                  Secondary
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Loading state</CardTitle>
                <CardDescription>Skeletons hold layout while data loads.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section id="overlays" title="Overlays and feedback">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    Dialogs confirm decisions that are hard to undo.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Keep it</Button>
                  </DialogClose>
                  <Button variant="destructive">Cancel it</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>Tooltips explain icons and shortcuts</TooltipContent>
            </Tooltip>
            <Button onClick={() => toast.success("Saved. We'll remind you a day before.")}>
              Show toast
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Error</Badge>
          </div>
        </Section>

        <Section id="navigation" title="Tabs and date picking">
          <div className="grid gap-8 sm:grid-cols-2">
            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="pt-3 text-sm text-muted-foreground">
                Tabs switch between views of the same thing.
              </TabsContent>
              <TabsContent value="past" className="pt-3 text-sm text-muted-foreground">
                Nothing here yet.
              </TabsContent>
            </Tabs>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-lg border"
            />
          </div>
        </Section>
        <Separator className="opacity-0" />
      </main>
      <Toaster />
    </TooltipProvider>
  )
}

export default App
