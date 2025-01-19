let socket = new WebSocket("wss://trading.3arbs.com:8443/");

socket.onopen = function(e) 
{
};
 
socket.onmessage = function(event) {
  data = JSON.parse(event.data);
  
  count = $("table#online-trading>tbody tr").length;

  if(count === 1)
  {
    data.forEach(function(item)
    {
      $("table#online-trading>tbody>tr:first").before(`<tr><td>${item.exchange}</td><td>${item.type}</td><td>${item.amount} ${item.curr1}</td><td><span class="${item.curr1.toLowerCase()}-20"></span> ${item.curr1}</td><td><span class="${item.curr2.toLowerCase()}-20"></span> ${item.curr2}</td><td><span class="${item.curr3.toLowerCase()}-20"></span> ${item.curr3}</td><td><b class="green">+${item.total_profit} ${item.curr1}</b></td></tr>`)
    });

    $("table#online-trading>tbody>tr.loading-trading").remove();
  }
  else
  {
    data = data[data.length-1];
    $("table#online-trading>tbody>tr:first").before(`<tr><td>${data.exchange}</td><td>${data.type}</td><td>${data.amount} ${data.curr1}</td><td><span class="${data.curr1.toLowerCase()}-20"></span> ${data.curr1}</td><td><span class="${data.curr2.toLowerCase()}-20"></span> ${data.curr2}</td><td><span class="${data.curr3.toLowerCase()}-20"></span> ${data.curr3}</td><td><b class="green">+${data.total_profit} ${data.curr1}</b></td></tr>`)
  }

  if(count >= 10)
    $("table#online-trading>tbody>tr:last").remove();

};

socket.onclose = function(event) {
  if (event.wasClean) {
    //alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    //alert('[close] Connection died');
  }
};

socket.onerror = function(error) {
  //alert(`[error] ${error.message}`);
};