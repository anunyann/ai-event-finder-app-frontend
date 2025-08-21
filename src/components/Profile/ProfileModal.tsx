import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "../UI/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "../../api";
import { ProfileForm, User, Event } from "@/types";
import { EventCard } from "@/components/Events/EventCard";

export default function ProfileModal({
                                         open,
                                         onOpenChange,
                                         onSaved,
                                         targetEmail
                                     }:{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved?: (data: ProfileForm) => void;
    targetEmail?: string;
}) {
    const { user: authUser } = useAuth();
    const [profileUser, setProfileUser] = useState<User | null>(null)
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null >(null);
    const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);

    const [form, setForm] = useState<ProfileForm>({
        name: "",
        surname: "",
        email: "",
        password: ""
    });

    const isSelf = useMemo(()=>{
        const myEmail = authUser?.email;
        const target = targetEmail ? targetEmail : authUser?.email;
        return myEmail && target && myEmail === target;
    }, [authUser, targetEmail]);

    useEffect(() => {
        if (!open) return;

        const emailToLoad = (targetEmail ?? authUser?.email ?? "").toLowerCase();
        if (!emailToLoad) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                // EXISTING: load the displayed user
                const u = await apiClient.getUserByEmail(emailToLoad); // GET /users/email/:email
                if (cancelled) return;

                setForm({
                    name: u.name ?? "",
                    surname: u.surname ?? "",
                    email: u.email ?? "",
                    password: "",
                });
                setEditMode(false);

                // NEW: load all events organized by this user
                setLoadingEvents(true);
                const evts = await apiClient.getEventsByOrganizer(emailToLoad);
                if (!cancelled) {
                    setOrganizedEvents(evts ?? []);
                }
            } catch (e: any) {
                if (!cancelled) setError(e?.message || "Failed to load profile");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setLoadingEvents(false); // NEW
                }
            }
        })();

        return () => { cancelled = true; };
    }, [open, targetEmail, authUser?.email]);

    useEffect(()=>{
        setForm({
            name: (authUser as any).name ?? "",
            surname: (authUser as any).surname ?? "",
            email: authUser.email ?? "",
            password: "",
        });
        setEditMode(false)
        setError(null)
    }, [open, authUser]);

    const canSave = useMemo(()=>{
        if(!editMode) return false;
        return form.email.trim().length>3; // minimal guard, adjust to validation checks later
    }, [editMode, form.email]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    const handleSave = async () => {
        if (!authUser) return;
        setLoading(true);
        setError(null);
        try {
            const identifierEmail = (authUser.email || form.email).toLowerCase();
            const payload: ProfileForm = {
                name: form.name,
                surname: form.surname,
                email: form.email,
            };
            if (form.password && form.password.trim().length > 0) {
                payload.password = form.password;
            }

            const updated = await apiClient.updateUser(payload)
            if(updated){
                localStorage.setItem('user', JSON.stringify(updated))
            }
            onSaved?.(updated);
            setEditMode(false);
            onOpenChange(false);
        } catch (e: any) {
            const message = e?.message || e?.error?.message || "Failed to update profile";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return(
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* FIXED: Removed max-w-lg constraint and changed to sm:max-w-4xl */}
            <DialogContent className="sm:max-w-4xl w-[95vw] h-fit overflow-hidden glass-card border border-card-border flex flex-col">
                <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                    <DialogDescription>
                        View your account details. Click Edit profile to update your info.
                    </DialogDescription>
                </DialogHeader>

                {/* Read only summary */}
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
                        <Separator className="my-2"/>
                        {isSelf && (<div className="flex justify-end">
                            <Button onClick={()=>setEditMode(true)}>Edit profile</Button>
                        </div>)}
                    </div>
                )}

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
                            <p className="text-xs text-muted-foreground">Leave blank to keep your current password.</p>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={()=>setEditMode(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={!canSave || loading}>
                                {loading ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}


                {/* FIXED: Working horizontal scroll section */}
                <div className="space-y-2">
                    <Label className="text-muted-foreground">Organized events</Label>

                    {loadingEvents ? (
                        <p className="text-sm text-muted-foreground">Loading events…</p>
                    ) : organizedEvents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No events found for this user.</p>
                    ) : (
                        <div className="w-full -mx-6">
                            <div
                                className="overflow-x-auto px-6 pb-2"
                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#cbd5e1 transparent'
                                }}
                            >
                                <div className="flex gap-4 w-max">
                                    {organizedEvents.map((evt) => (
                                        <div key={evt.id} className="flex-shrink-0 w-80 h-349">
                                            <EventCard event={evt} onManageParticipants={undefined} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );

}