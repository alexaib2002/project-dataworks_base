import { Box, styled } from "@mui/material";

import React from "react";
import { ipcRenderer } from "electron";

const PreviewContainer = styled('div')(({ theme }) => {
    return {
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    };
});

function RegistryPreview({ fk, fkval, originTab }) {
    const [registry, setRegistry] = React.useState(null);

    React.useEffect(() => {
        ipcRenderer.send('mesg-db-get-fk-table', { table: originTab, fk: fk });
        ipcRenderer.once('reply-db-get-fk-table', (_, fkRow: any) => {
            ipcRenderer.send('mesg-db-get-registry', { table: fkRow.table, where: [{ what: fkRow.to, filter: fkval }] });
            ipcRenderer.once('reply-db-get-registry', (_, reg) => {
                setRegistry(reg);
            });
        });
    }, [fk, fkval, originTab]);

    return (
        <PreviewContainer>
            {registry && Object.keys(registry).map((key) => {
                return (
                    <Box key={key}>
                        {key}: {registry[key]}
                    </Box>
                );
            })}
        </PreviewContainer>
    );
}

export default RegistryPreview;