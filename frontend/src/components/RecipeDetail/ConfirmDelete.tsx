import "../../styles/RecipeDetail.css";
import {X, CircleAlert } from "lucide-react"

interface ConfirmDeleteProps {
  closeForm: React.Dispatch<React.SetStateAction<boolean>>;
  comment_id: string;
  confirmDelete: (comment_id : string) => void;
} 

const ConfirmDelete = ( {closeForm, confirmDelete, comment_id} : ConfirmDeleteProps ) => {

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
            onClick={() => {confirmDelete(comment_id); closeForm(prevState => !prevState)}}
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