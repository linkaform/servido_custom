### Para actualizar el proyecto y descargar todos los sub proyectos
git clone git@github.com:linkaform/servido_custom.git
cd custom/
for module in $(grep path .gitmodules  | awk '{ print $3 }'); do
   git submodule update --init $module
done

git fetch --recurse-submodules
git fetch --recurse-submodules
git pull --recurse-submodules
git submodule foreach --recursive git checkout master
git submodule foreach --recursive git pull origin master
