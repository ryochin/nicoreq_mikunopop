#!perl

use strict;
use File::Path;

# caches
my $cache_dir = 'System/caches';
File::Path::rmtree( [ $cache_dir ], 1, 1);

mkdir $cache_dir;

__END__
