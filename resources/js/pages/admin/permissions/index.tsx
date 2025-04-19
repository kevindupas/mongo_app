import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash } from 'lucide-react';
import { useState } from 'react';

interface Permission {
    // Handle both possible ID formats
    id?: string;
    _id?: string;
    name: string;
}

interface PermissionsPageProps {
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Permissions',
        href: '/admin/permissions',
    },
];

// Helper function to get the correct ID from a permission
const getPermissionId = (permission: Permission): string => {
    return String(permission._id || permission.id || '');
};

export default function PermissionsIndex({ permissions }: PermissionsPageProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const { delete: destroy } = useForm();

    const handleAddPermission = () => {
        post(route('admin.permissions.store'), {
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
            },
        });
    };

    const handleDeletePermission = (permission: Permission) => {
        // Get the correct ID (either _id or id)
        const permissionId = getPermissionId(permission);

        if (!permissionId) {
            console.error('Permission ID is undefined or empty');
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir supprimer cette permission?')) {
            destroy(route('admin.permissions.destroy', { permission: permissionId }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des permissions" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Gestion des permissions" description="Créez et gérez les permissions système" />

                    <Dialog
                        open={isDialogOpen}
                        onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) reset();
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter une permission
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter une nouvelle permission</DialogTitle>
                                <DialogDescription>Définissez un nom pour cette permission.</DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nom de la permission</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Nom de la permission"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" onClick={() => reset()}>
                                        Annuler
                                    </Button>
                                </DialogClose>
                                <Button onClick={handleAddPermission} disabled={processing}>
                                    Créer la permission
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle>Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.map((permission) => (
                                    <TableRow key={getPermissionId(permission)}>
                                        <TableCell className="font-medium">{permission.name}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeletePermission(permission)}>
                                                <Trash className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {permissions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center">
                                            Aucune permission trouvée
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
