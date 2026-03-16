import * as React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiTrash, FiPlus } from "react-icons/fi";
import styles from "./DragAndDrop.module.css";

/* ================= TYPES ================= */
export interface Activity {
  id: string;
  description: string;
}

export interface DragAndDropProps {
  value?: Activity[];
  onChange?: (value: Activity[]) => void;
  removeIconSlot?: React.ReactNode;
}

/* ============== SORTABLE ITEM ============== */
const SortableItem = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className={styles.activity}>
        <span
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </span>
        {children}
      </div>
    </div>
  );
};

/* ============== MAIN COMPONENT ============== */
function DragAndDrop_(
  props: DragAndDropProps,
  ref: React.Ref<HTMLDivElement>
) {
  const { value = [], onChange } = props;

  const [activities, setActivities] = React.useState<Activity[]>(value);

  /* ---- sync value -> state ---- */
  React.useEffect(() => {
    if (Array.isArray(value)) {
      setActivities(value);
    }
  }, [value]);

  /* ---- single state updater ---- */
  const updateActivities = (next: Activity[]) => {
    setActivities(next);
    onChange?.(next);
  };

  /* ---- actions ---- */

  const getNextId = (activities: Activity[]) => {
  if (activities.length === 0) return "1";

  const maxId = Math.max(
    ...activities
      .map(a => parseInt(a.id, 10))
      .filter(n => !isNaN(n))
  );

  return String(maxId + 1);
};

  const addActivity = () => {
    updateActivities([
      ...activities,
      { id:getNextId(activities), description: "" },
    ]);
  };

  const removeActivity = (id: string) => {
    updateActivities(activities.filter(a => a.id !== id));
  };

  const updateActivity = (id: string, description: string) => {
    updateActivities(
      activities.map(a =>
        a.id === id ? { ...a, description } : a
      )
    );
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activities.findIndex(a => a.id === active.id);
    const newIndex = activities.findIndex(a => a.id === over.id);

    updateActivities(arrayMove(activities, oldIndex, newIndex));
  };

  /* ---- render ---- */

  return (
    <div ref={ref} className={styles.globalActivity}>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={activities.map(a => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.activities}>
            {activities.map(activity => (
              <SortableItem key={activity.id} id={activity.id}>
                <input
                  className={styles.inputActivity}
                  type="text"
                  value={activity.description}
                  placeholder="Activity description"
                  onChange={e =>
                    updateActivity(activity.id, e.target.value)
                  }
                />
                <button
                  className={styles.removeButton}
                  onClick={() => removeActivity(activity.id)}
                >
                  {props.removeIconSlot || <FiTrash />}
                </button>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button className={styles.addButton} onClick={addActivity}>
        <FiPlus /> Ajouter une activité
      </button>
    </div>
  );
}

/* ============== EXPORT ============== */
const DragAndDrop = React.forwardRef(DragAndDrop_);
export default DragAndDrop;
