<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Role extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'roles';
    protected $fillable = ['name', 'permissions'];

    public function permissions()
    {
        return $this->embedsMany(Permission::class);
    }
}
