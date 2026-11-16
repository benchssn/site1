import { rooms } from "@/lib/collective";
import Geometry from "./geometry";

export function CollectivePreview() {
  return <figure className="collective-preview">
    <figcaption>Preview of The Collective · Sample conversation</figcaption>
    <div className="collective-preview-frame">
      <div className="collective-preview-rooms" aria-label="Rooms">
        {rooms.map(({ id, name }, index) => <span className={id === "mind" ? "preview-selected" : ""} key={id}>
          <small>0{index + 1}</small> {name}
        </span>)}
      </div>
      <div className="collective-preview-content">
        <div className="collective-preview-heading"><h2>The Mind</h2><Geometry /></div>
        <p><strong>◇ &nbsp; aftertone</strong> Has anyone tried sketching an afterimage before it fades?</p>
        <p><strong>○ &nbsp; prismfield</strong> I tried it with blue light. The edges were the first thing to disappear.</p>
      </div>
    </div>
  </figure>;
}
