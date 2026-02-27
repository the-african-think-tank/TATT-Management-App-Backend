import { UserTypeCard } from "@/components/atoms/user-type-card";
import { FormLabel } from "@/components/atoms/form-label";
import { User, HeartHandshake } from "lucide-react";

type JoinAsSelectorProps = {
  value: "MEMBER" | "VOLUNTEER";
  onChange: (value: "MEMBER" | "VOLUNTEER") => void;
};

export function JoinAsSelector({ value, onChange }: JoinAsSelectorProps) {
  return (
    <div className="space-y-3">
      <FormLabel className="font-semibold leading-5">Join as</FormLabel>
      <div className="grid grid-cols-2 gap-3">
        <UserTypeCard
          selected={value === "MEMBER"}
          icon={<User className="h-5 w-5" />}
          onClick={() => onChange("MEMBER")}
        >
          Member
        </UserTypeCard>
        <UserTypeCard
          selected={value === "VOLUNTEER"}
          icon={<HeartHandshake className="h-5 w-5" />}
          onClick={() => onChange("VOLUNTEER")}
        >
          Volunteer
        </UserTypeCard>
      </div>
    </div>
  );
}
