Vagrant.configure("2") do |config|
  config.vm.box = "debian8-lamp"
  config.vm.box_url = "file:///home/swenceslao/debian8-lamp.box"
  config.vm.provider :virtualbox do |vb|
    vb.customize ["modifyvm", :id, "--memory", 2048]
  end

  project = 'eguide'

  config.vm.synced_folder ".", "/vagrant", :disabled => true
  config.vm.synced_folder ".", "/var/www/html/#{project}.dev", :nfs => true
  config.vm.hostname = "#{project}.dev"

  config.ssh.forward_agent  = true
  config.vm.network :private_network, ip: "10.33.39.13"
end
