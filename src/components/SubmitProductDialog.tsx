import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SubmitProductDialog = () => {
  const navigate = useNavigate();

  return (
    <Button 
      onClick={() => navigate("/submit")}
      className="bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-elegant min-h-[44px] px-4 sm:px-6 text-base"
      aria-label="Submit a new app to VibeList"
    >
      <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">Add New APP</span>
      <span className="sm:hidden">Add APP</span>
    </Button>
  );
};
