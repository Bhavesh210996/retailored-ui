import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";

interface Status {
  id: string | number;
  name: string;
}

interface StatusSideBarProps {
  availableStatuses: Status[];
  handleItemStatusUpdate: (id: number) => void;
  getStatusSeverity: (status: string) => string | undefined | null;
  statusSidebarVisible: boolean;
  setStatusSidebarVisible: (visible: boolean) => void;
}

const StatusSideBar = ({availableStatuses, handleItemStatusUpdate, getStatusSeverity, statusSidebarVisible, setStatusSidebarVisible} : StatusSideBarProps) => {
    return (
        <Sidebar
            visible={statusSidebarVisible} 
            onHide={() => setStatusSidebarVisible(false)}
            position="bottom"
            style={{ 
              width: '100%',
              height: 'auto',
              maxHeight: '62vh',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
            }}
            header={
              <div className="sticky top-0 bg-white z-1 p-3 border-bottom-1 surface-border flex justify-content-between align-items-center">
                <span className="font-bold text-xl">Update Item Status</span>
              </div>
            }
            className="p-0"
        >
            <div className="p-3">
              <div className="grid">
                {availableStatuses.map(status => (
                  <div key={status.id} className="col-12 md:col-6 lg:col-4 p-2">
                    <Button
                      label={status.name}
                      onClick={() => handleItemStatusUpdate(Number(status.id))}
                      severity={getStatusSeverity(status.name) || undefined}
                      className="w-full p-3 text-lg justify-content-start p-button-outlined"
                      icon={
                        status.name === 'Completed' ? 'pi pi-check-circle' :
                        status.name === 'In Progress' ? 'pi pi-spinner' :
                        status.name === 'Pending' ? 'pi pi-clock' :
                        status.name === 'Cancelled' ? 'pi pi-times-circle' :
                        'pi pi-info-circle'
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
        </Sidebar>
    )
}

export default StatusSideBar;