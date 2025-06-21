import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatError } from "@/lib/utils";
import { Mail, Bell, Settings } from "lucide-react";

export const EmailSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchingSubscription, setFetchingSubscription] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
      setEmail(user.email || "");
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("email_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching subscription:", formatError(error));
      } else if (data) {
        setSubscription(data);
        setEmail(data.email);
        setFrequency(data.frequency);
        setIsActive(data.is_active);
      }
    } catch (error) {
      console.error("Error fetching subscription:", formatError(error));
    } finally {
      setFetchingSubscription(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !email) {
      toast({
        title: "Error",
        description: "Please provide a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (subscription) {
        // Update existing subscription
        const { error } = await supabase
          .from("email_subscriptions")
          .update({
            email,
            frequency,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", subscription.id);

        if (error) throw error;

        toast({
          title: "Updated!",
          description: "Your email subscription has been updated.",
        });
      } else {
        // Create new subscription
        const { error } = await supabase.from("email_subscriptions").insert({
          user_id: user.id,
          email,
          frequency,
          is_active: isActive,
        });

        if (error) throw error;

        toast({
          title: "Subscribed!",
          description: "You'll receive trending movies in your inbox.",
        });
      }

      await fetchSubscription();
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!subscription) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("email_subscriptions")
        .delete()
        .eq("id", subscription.id);

      if (error) throw error;

      setSubscription(null);
      toast({
        title: "Unsubscribed",
        description: "You won't receive trending movie emails anymore.",
      });
    } catch (error: any) {
      console.error("Unsubscribe error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to unsubscribe.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Stay Updated</CardTitle>
          <CardDescription>
            Sign in to get daily trending movies delivered to your inbox
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (fetchingSubscription) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Daily Trending Movies</CardTitle>
        <CardDescription>
          Get the latest trending movies and shows delivered to your inbox
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="active">Active subscription</Label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Saving..." : subscription ? "Update" : "Subscribe"}
          </Button>
          {subscription && (
            <Button
              onClick={handleUnsubscribe}
              variant="outline"
              disabled={loading}
            >
              Unsubscribe
            </Button>
          )}
        </div>

        {subscription && (
          <div className="text-center text-sm text-muted-foreground">
            <Settings className="h-4 w-4 inline mr-1" />
            Last sent:{" "}
            {subscription.last_sent_at
              ? new Date(subscription.last_sent_at).toLocaleDateString()
              : "Never"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
