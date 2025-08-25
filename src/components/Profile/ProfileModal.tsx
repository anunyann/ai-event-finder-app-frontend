import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog.tsx";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "../../api";
import { ProfileForm, User, Event } from "@/types";
import { EventCard } from "@/components/Events/EventCard";
import { ParticipantsDrawer } from "@/components/Participants/ParticipantsDrawer.tsx";
import { useToast } from "@/hooks/use-toast";
import { EventForm } from "@/components/Events/EventForm.tsx";

export default function ProfileModal({
                                         open,
                                         onOpenChange,
                                         onSaved,
                                         targetEmail,
                                     }: Readonly<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved?: (data: ProfileForm) => void;
    targetEmail?: string;
}>) {
    const { user: authUser } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);

    const [participantsOpen, setParticipantsOpen] = useState(false);
    const [participantsEvent, setParticipantsEvent] = useState<Event | null>(null);

    // Edit Event modal state
    const [editOpen, setEditOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [originalTitle, setOriginalTitle] = useState<string | null>(null);
    const [editInitial, setEditInitial] = useState<{
        title: string;
        description: string;
        datetime: Date | undefined;
        location: string;
        category: string;
        organizer_email: string;
    } | null>(null);

    // Delete confirm state
    const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

    const { toast } = useToast();

    const [form, setForm] = useState<ProfileForm>({
        name: "",
        surname: "",
        email: "",
        password: "",
    });

    const isSelf = useMemo(() => {
        const myEmail = authUser?.email;
        const target = targetEmail ? targetEmail : authUser?.email;
        return !!myEmail && !!target && myEmail === target;
    }, [authUser, targetEmail]);

    useEffect(() => {
        if (!open) return;

        const emailToLoad = (targetEmail ?? authUser?.email ?? "").toLowerCase();
        if (!emailToLoad) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        setForm({ name: "", surname: "", email: "", password: "" });
        setOrganizedEvents([]);   // optional: also clear the events list


        (async () => {
            try {
                const u = await apiClient.getUserByEmail(emailToLoad);
                if (cancelled) return;

                setForm({
                    name: u.name ?? "",
                    surname: u.surname ?? "",
                    email: u.email ?? "",
                    password: "",
                });
                setEditMode(false);

                setLoadingEvents(true);
                const evts = await apiClient.getEventsByOrganizer(emailToLoad);
                if (!cancelled) setOrganizedEvents(evts ?? []);
            } catch (e: unknown) {
                const msg =
                    typeof e === "object" && e && "message" in e
                        ? String((e as { message?: unknown }).message || "")
                        : "Failed to load profile";
                if (!cancelled) setError(msg);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setLoadingEvents(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [open, targetEmail, authUser?.email]);

    useEffect(() => {
        if (!authUser) return;
        setForm({
            name: authUser.name ?? "",
            surname: authUser.surname ?? "",
            email: authUser.email ?? "",
            password: "",
        });
        setEditMode(false);
        setError(null);
    }, [open, authUser]);

    const canSave = useMemo(() => {
        if (!editMode) return false;
        return form.email.trim().length > 3;
    }, [editMode, form.email]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!authUser) return;
        setLoading(true);
        setError(null);
        try {
            const payload: ProfileForm = {
                name: form.name,
                surname: form.surname,
                email: form.email,
            };
            if (form.password?.trim()) {
                payload.password = form.password;
            }

            const updated = await apiClient.updateUser(payload);
            if (updated) {
                localStorage.setItem("user", JSON.stringify(updated));
            }
            toast({
                title: "Profile updated",
                description: "Your changes have been saved.",
            });

            onSaved?.(updated);
            setEditMode(false);
            onOpenChange(false);
        } catch (e: unknown) {
            const msg =
                typeof e === "object" && e && "message" in e
                    ? String((e as { message?: unknown }).message || "")
                    : typeof e === "object" && e && "error" in e
                        ? String((e as { error?: { message?: unknown } }).error?.message || "")
                        : "Failed to update profile";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (event: Event) => {
        setOriginalTitle(event.title);
        setEditInitial({
            title: event.title,
            description: event.description ?? "",
            datetime: event.datetime ? new Date(event.datetime as unknown as string) : undefined,
            location: event.location ?? "",
            category: event.category ?? "",
            organizer_email: event.organizer?.email ?? "",
        });
        setEditOpen(true);
    };

    const refreshOrganized = async (email: string) => {
        const evts = await apiClient.getEventsByOrganizer(email);
        setOrganizedEvents(evts ?? []);
    };

    // Robust, type-safe timestamp from Event.datetime (usually a string)
    const sortedOrganizedEvents = useMemo(() => {
        const toTs = (e: Event): number => {
            const v = e?.datetime as unknown; // backend likely returns string
            if (typeof v === "string") {
                const ms = Date.parse(v);
                return Number.isFinite(ms) ? ms : Number.POSITIVE_INFINITY;
            }
            // if backend ever sends Date-like
            if (v && typeof v === "object" && "toString" in v) {
                const ms = Date.parse(String(v));
                return Number.isFinite(ms) ? ms : Number.POSITIVE_INFINITY;
            }
            return Number.POSITIVE_INFINITY;
        };
        return [...organizedEvents].sort((a, b) => toTs(a) - toTs(b));
    }, [organizedEvents]);

    const handleEditSubmit = async (data: {
        title: string;
        description: string;
        datetime: string;
        location: string;
        category: string;
        organizer_email: string;
    }) => {
        if (!originalTitle) return;
        setIsUpdating(true);
        try {
            await apiClient.updateEvent(originalTitle, data);
            toast({
                title: "Event updated",
                description: `"${data.title}" has been saved`,
                className: "bg-success text-success-foreground",
            });
            setEditOpen(false);

            const emailToLoad = (targetEmail ?? authUser?.email ?? "").toLowerCase();
            if (emailToLoad) await refreshOrganized(emailToLoad);
        } catch (e: unknown) {
            const msg =
                typeof e === "object" && e && "message" in e
                    ? String((e as { message?: unknown }).message || "")
                    : "Failed to update event";
            toast({
                title: "Error updating event",
                description: msg,
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = (event: Event) => {
        setDeleteTarget(event);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const title = deleteTarget.title;

        // optimistic UI
        setOrganizedEvents((prev) => prev.filter((e) => e.title !== title));
        setDeleteTarget(null);

        try {
            await apiClient.deleteEvent(title);
            toast({
                title: "Event deleted",
                description: `“${title}” has been removed`,
                className: "bg-success text-success-foreground",
            });
            const emailToLoad = (targetEmail ?? authUser?.email ?? "").toLowerCase();
            if (emailToLoad) await refreshOrganized(emailToLoad);
        } catch (e: unknown) {
            const msg =
                typeof e === "object" && e && "message" in e
                    ? String((e as { message?: unknown }).message || "")
                    : "Failed to delete event";
            // revert by reloading
            const emailToLoad = (targetEmail ?? authUser?.email ?? "").toLowerCase();
            if (emailToLoad) await refreshOrganized(emailToLoad);
            toast({
                title: "Error deleting event",
                description: msg,
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="sm:max-w-4xl w-[95vw] h-fit overflow-hidden glass-card border border-card-border flex flex-col">
                <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                    {isSelf && (
                        <DialogDescription>
                            View your account details. Click Edit profile to update your info.
                        </DialogDescription>
                    )}
                </DialogHeader>

                {/* Read-only summary */}
                {!editMode && (
                    <div className="space-y-3">
                        <div>
                            <Label className="text-muted-foreground">Email</Label>
                            <p className="mt-1 font-medium">{form.email || "-"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Name</Label>
                                <p className="mt-1 font-medium">{form.name || "-"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Surname</Label>
                                <p className="mt-1 font-medium">{form.surname || "-"}</p>
                            </div>
                        </div>
                        <Separator className="my-2" />
                        {isSelf && (
                            <div className="flex justify-end">
                                <Button onClick={() => setEditMode(true)}>Edit profile</Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Edit form */}
                {editMode && (
                    <div className="space-y-4">
                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 rounded-md p-2">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="surname">Surname</Label>
                                <Input
                                    id="surname"
                                    name="surname"
                                    value={form.surname}
                                    onChange={handleChange}
                                    placeholder="Your surname"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">New password (optional)</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave blank to keep your current password.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setEditMode(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={!canSave || loading}>
                                {loading ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* Organized events */}
                {!editMode && (
                    <div className="space-y-2">
                        <Label className="text-muted-foreground font-bold">Organized events</Label>
                        {loadingEvents ? (
                            <p className="text-sm text-muted-foreground">Loading events…</p>
                        ) : sortedOrganizedEvents.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No events found for this user.</p>
                        ) : (
                            <div className="w-full -mx-6">
                                <div
                                    className="overflow-x-auto pb-2"
                                    style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
                                >
                                    <div className="flex w-max gap-4 pl-6 pr-6">
                                        {sortedOrganizedEvents.map((evt) => (
                                            <div key={evt.title} className="flex-none w-80">
                                                <EventCard
                                                    event={evt}
                                                    onManageParticipants={() => {
                                                        setParticipantsEvent(evt);
                                                        setParticipantsOpen(true);
                                                    }}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {participantsOpen && (
                    <ParticipantsDrawer
                        open={participantsOpen}
                        onOpenChange={setParticipantsOpen}
                        eventTitle={participantsEvent?.title || ""}
                    />
                )}

                {/* Edit Event modal */}
                <EventForm
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    onSubmit={handleEditSubmit}
                    isLoading={isUpdating}
                    mode="edit"
                    initial={editInitial ?? undefined}
                />
            </DialogContent>
        </Dialog>
    );
}
