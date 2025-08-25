import { Link, useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import ProfileModal from '../Profile/ProfileModal';
import { useState } from 'react';

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);


    const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-card-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Navigation */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <img src="/favicon.ico"></img>
            </div>
            <span className="text-xl font-bold text-gradient">
              AI Event Finder
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-muted/50"
            >

            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-muted/50"
            >
              <Link to="/events">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </Link>
            </Button>
          </nav>
        </div>

        {/* User Controls */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />

            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {getUserInitials()}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56 glass-card" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-medium text-sm">{user?.email || "User"}</p>
                        </div>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Use a real menu item so the dropdown closes properly */}
                    <DropdownMenuItem
                        onSelect={() => {
                            // 1) close the menu
                            setMenuOpen(false);
                            // 2) after it's unmounted, open the dialog
                            requestAnimationFrame(() => setProfileOpen(true));
                        }}
                    >
                        View profile
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={handleLogout}
                        className="text-destructive focus:text-destructive"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

        </div>
      </div>
      <ProfileModal 
      open={profileOpen}
      onOpenChange={setProfileOpen}
      onSaved={()=>{}}
      />
    </header>
  );
}