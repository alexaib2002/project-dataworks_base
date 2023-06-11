import { Box } from "@mui/material";
import React from "react";
import { ipcRenderer } from "electron";

function RegistryPreview({ fk, fkval, table }) {
    const [registry, setRegistry] = React.useState(null);

    React.useEffect(() => {
        ipcRenderer.send('mesg-db-get-registry', { table, where: [{ what: fk, filter: fkval }] });
        ipcRenderer.once('reply-db-get-registry', (_, dbRow) => {
            setRegistry(dbRow);
        });
    }, [fk, fkval, table]);

    return (
        <Box>
            {registry && Object.keys(registry).map((key) => {
                return (
                    <Box key={key}>
                        {key}: {registry[key]}
                    </Box>
                );
            })}
        </Box>
    );
}

export default RegistryPreview;