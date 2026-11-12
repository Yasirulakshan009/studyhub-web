export const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  
  export const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  
  export const refName = (ref: string | { _id: string; name: string }) =>
    typeof ref === "object" ? ref.name : ""