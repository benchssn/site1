import { rooms } from "@/lib/collective";
import Geometry from "./geometry";

export function CollectivePreview() {
  return <figure className="collective-preview">
    <figcaption>Preview of a room</figcaption>
    <div className="collective-preview-frame">
      <div className="collective-preview-rooms" aria-label="Rooms">
        {rooms.map(({ id, name }, index) => <span className={id === "mind" ? "preview-selected" : ""} key={id}>
          <small>0{index + 1}</small> {name}
        </span>)}
      </div>
      <div className="collective-preview-content">
        <div className="collective-preview-heading"><h2>The Mind</h2><Geometry /></div>
      </div>
    </div>
  </figure>;
}
