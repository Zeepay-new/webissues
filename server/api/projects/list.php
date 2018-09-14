<?php
/**************************************************************************
* This file is part of the WebIssues Server program
* Copyright (C) 2006 Michał Męciński
* Copyright (C) 2007-2017 WebIssues Team
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
**************************************************************************/

require_once( '../../../system/bootstrap.inc.php' );

class Server_Api_Projects_List
{
    public $access = 'anonymous';

    public $params = array();

    public function run()
    {
        $projectManager = new System_Api_ProjectManager();
        $projects = $projectManager->getProjects();

        $result[ 'projects' ] = array();

        foreach ( $projects as $project ) {
            $resultProject = array();

            $resultProject[ 'id' ] = (int)$project[ 'project_id' ];
            $resultProject[ 'name' ] = $project[ 'project_name' ];
            $resultProject[ 'access' ] = (int)$project[ 'project_access' ];
            $resultProject[ 'public' ] = $project[ 'is_public' ] != 0;

            $result[ 'projects' ][] = $resultProject;
        }

        return $result;
    }
}

System_Bootstrap::run( 'Server_Api_Application', 'Server_Api_Projects_List' );
