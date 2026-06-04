import "../../styles/RecipeDetail.css";
import {X, CircleAlert } from "lucide-react"
import type { Comments } from "../../../../shared/types/index.ts"

interface ConfirmDeleteProps {
  closeForm: React.Dispatch<React.SetStateAction<boolean>>;
  comment: Comments | null;
  confirmDelete: (comment : Comments | null, parent_id: string) => void;
  parent_id: string;
} 

const ConfirmDelete = ( {closeForm, confirmDelete, comment, parent_id} : ConfirmDeleteProps ) => {

  return (
    <>
      <div className="confirm-delete-form">
        <X className="exit-icon" 
        onClick={()=>closeForm(prevState=>!prevState)}/>
        <p></p>

        {/* inputs section */}
        <div style={{display: "flex", flexDirection: "column", alignItems:"center"}}>
          <CircleAlert className="text-yellow-500 w-[4rem] h-[4rem] mb-[1rem]" />
          <p className="text-[2rem] font-bold pb-[1rem]">Confirm Delete</p>
          <p>This action cannot be undone</p>

          <div className="flex gap-[1rem] mt-[1rem]">
            <button
            onClick={() => {confirmDelete(comment, parent_id); closeForm(prevState => !prevState)}}
            className="reply-button"
            >
              Confirm
            </button>
            <button
            onClick={() => closeForm(prevState=>!prevState)}
            className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
export default ConfirmDelete;