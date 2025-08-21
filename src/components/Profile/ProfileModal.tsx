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
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "../../api"; // adjust import path to your ApiClient
import { ProfileForm, User } from "@/types";

export default function ProfileModal({
    open,
    onOpenChange,
    onSaved,
}:{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved?: (data: ProfileForm) => void;
}) {
    const { user } = useAuth();
    const [currentUser, setCurrentUser] = useState<User>(user)
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null >(null);

    const [form, setForm] = useState<ProfileForm>({
        name: "",
        surname: "",
        email: "",
        password: ""
    });

    useEffect(()=>{
        setForm({
            name: (user as any).name ?? "",
            surname: (user as any).surname ?? "",
            email: user.email ?? "",
            password: "",
        });
        setEditMode(false)
        setError(null)
    }, [open, user]);

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
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            // —— Choose one of the following server strategies ——
            // 1) PATCH /users/me (recommended) — backend resolves from JWT
            // const updated = await apiClient.updateMe({
            // name: form.name,
            // surname: form.surname,
            // email: form.email,
            // password: form.password || undefined,
            // });


            // 2) PATCH /users/email/:email — using the previous email as identifier
            // (works with your current getUserByEmail style)
            const identifierEmail = (user.email || form.email).toLowerCase();
            const payload: ProfileForm = {
                name: form.name,
                surname: form.surname,
                email: form.email,
            };
            if (form.password && form.password.trim().length > 0) {
            payload.password = form.password;
            }


            // You may already have an update endpoint; if not, create it server-side.
            // Here we assume PATCH /users/email/:email
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
            <DialogContent className="sm:max-w-lg glass-card border border-card-border">
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
                        <div className="flex justify-end">
                            <Button onClick={()=>setEditMode(true)}>Edit profile</Button>
                        </div>
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
 
            </DialogContent>
        </Dialog>
        );
    
}