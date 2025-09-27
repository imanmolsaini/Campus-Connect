// join club page which allows user to apply to join a club by filling out a form
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { clubAPI } from "@/services/api";

export default function JoinClubPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    studentId: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // call backend to send email to club admin
      const res = await clubAPI.applyToClub(id as string, form);
      if (res.success) {
        toast.success("Application sent to club admin!");
        router.push("/clubs");
      } else {
        toast.error(res.message || "Failed to apply.");
      }
    } catch (err) {
      toast.error("Failed to apply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">Apply to Join Club</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Your Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Student ID"
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            required
          />
          <div>
            <label className="form-label">Why do you want to join?</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={4}
              className="form-input"
              required
            />
          </div>
          {/* submit button */}
          <Button type="submit" loading={loading} className="w-full">
            Submit Application
          </Button>
        </form>
        {/* Back Button */}
        <Button
          type="button"
          variant="ghost"
          className="mt-4 w-full"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </Card>
    </div>
  );
}